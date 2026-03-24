package com.vibeshop.api.auth;

public record SocialIdentity(
    AuthProviderType provider,
    String providerUserId,
    String email,
    String displayName,
    boolean emailVerified
) {
}
