from django.shortcuts import render, redirect
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
import requests
from .util import update_or_create_user_tokens, is_spotify_authenticated
from rest_framework import status
from rest_framework.response import Response
from urllib.parse import urlencode
import base64
from api import views as api_views

class AuthURL(APIView):
        def get(self, request, format=None):
                if not request.session.exists(request.session.session_key):
                    request.session.create()
                host = self.request.session.session_key
                url = 'https://accounts.spotify.com/authorize'
                scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
                data = urlencode({"scope": scopes, "response_type":"code", "redirect_uri": REDIRECT_URI,"client_id":CLIENT_ID, 'host': host })
                # print(data)
                lookup_url = f"{url}?{data}"
                # print(lookup_url)
                res = requests.get(lookup_url)
                # print(response.url)
                # print(CLIENT_SECRET, CLIENT_ID)
                
                return Response({'url': res.url, 'host' : host }, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')
    client_creds = f"{CLIENT_ID}:{CLIENT_SECRET}"
    client_creds_b64 = base64.b64encode(client_creds.encode())

    # response = requests.post('https://accounts.spotify.com/api/token', data={
    #     'grant_type': 'authorization_code',
    #     'code': code,
    #     'redirect_uri': REDIRECT_URI
    # }, headers={
    #         "Authorization":f"Basic {client_creds_b64.decode()}"
    # }).json()

    response = requests.post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    print('response url in spotify views.py spotify_callback fn ', response)
    print('session in spotify_callback ', request.session, request.session.session_key)

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    print('before ', request.session.session_key)
    if not request.session.exists(request.session.session_key):
        request.session.create()
    print('after ', request.session.session_key)
    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

