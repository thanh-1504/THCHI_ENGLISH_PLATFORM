import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    // private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_AUTH_CLIENT_ID') as string,
      clientSecret: configService.get<string>(
        'GOOGLE_AUTH_CLIENT_SECRET',
      ) as string,
      callbackURL: configService.get<string>(
        'GOOGLE_AUTH_REDIRECT_URI',
      ) as string,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifiedCallback,
  ) {
    try {
      const user = await this.authService.findOrCreateGoogleUser({
        googleId: profile.id,
        email: profile.emails?.[0]?.value ?? '',
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value ?? '',
      });
      done(null, user);
    } catch (error) {
      console.log(error);
    }
  }
}
