package com.vibeshop.api.auth;

public interface SocialIdentityVerifier {

    SocialIdentity verify(AuthProviderType provider, String accessToken);
}
