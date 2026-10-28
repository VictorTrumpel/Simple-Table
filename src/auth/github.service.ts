import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

type GithubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GithubUserResponse = {
  login?: string;
  name?: string | null;
  email?: string | null;
};

type GithubEmailResponse = {
  email?: string;
  primary?: boolean;
  verified?: boolean;
};

const GITHUB_API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'simple-table',
};

@Injectable()
export class GithubService {
  async getAccessToken(code: string): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Вход через GitHub не настроен');
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    });

    const redirectUri = process.env.GITHUB_REDIRECT_URI?.trim();

    if (redirectUri) {
      body.set('redirect_uri', redirectUri);
    }

    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
        signal: AbortSignal.timeout(10_000),
      },
    ).catch(() => null);

    if (!response?.ok) {
      throw new UnauthorizedException(
        'Не удалось подтвердить вход через GitHub. Попробуйте ещё раз.',
      );
    }

    let tokenData: GithubTokenResponse;

    try {
      tokenData = (await response.json()) as GithubTokenResponse;
    } catch {
      throw new UnauthorizedException(
        'Не удалось подтвердить вход через GitHub. Попробуйте ещё раз.',
      );
    }

    if (!tokenData.access_token) {
      throw new UnauthorizedException(
        'Не удалось подтвердить вход через GitHub. Попробуйте ещё раз.',
      );
    }

    return tokenData.access_token;
  }

  async getProfile(
    accessToken: string,
  ): Promise<{ email: string; name: string }> {
    const headers: Record<string, string> = {
      ...GITHUB_API_HEADERS,
      Authorization: `Bearer ${accessToken}`,
    };

    const userResponse = await fetch('https://api.github.com/user', {
      headers,
      signal: AbortSignal.timeout(10_000),
    }).catch(() => null);

    if (!userResponse?.ok) {
      throw new UnauthorizedException(
        'Не удалось получить профиль GitHub. Попробуйте ещё раз.',
      );
    }

    let user: GithubUserResponse;

    try {
      user = (await userResponse.json()) as GithubUserResponse;
    } catch {
      throw new UnauthorizedException(
        'Не удалось получить профиль GitHub. Попробуйте ещё раз.',
      );
    }

    const login = user.login?.trim();
    const name = user.name?.trim() || login;

    if (!login || !name) {
      throw new UnauthorizedException(
        'Не удалось получить профиль GitHub. Попробуйте ещё раз.',
      );
    }

    const email = await this.getEmail(headers, user.email?.trim() || null);

    return { email, name };
  }

  private async getEmail(
    headers: Record<string, string>,
    profileEmail: string | null,
  ): Promise<string> {
    if (profileEmail) {
      return profileEmail;
    }

    const response = await fetch('https://api.github.com/user/emails', {
      headers,
      signal: AbortSignal.timeout(10_000),
    }).catch(() => null);

    if (!response?.ok) {
      throw new UnauthorizedException(
        'Разрешите доступ к электронной почте в настройках GitHub.',
      );
    }

    let emails: GithubEmailResponse[];

    try {
      emails = (await response.json()) as GithubEmailResponse[];
    } catch {
      throw new UnauthorizedException(
        'Разрешите доступ к электронной почте в настройках GitHub.',
      );
    }

    if (!Array.isArray(emails)) {
      throw new UnauthorizedException(
        'Разрешите доступ к электронной почте в настройках GitHub.',
      );
    }

    const email =
      emails.find((item) => item.primary && item.verified)?.email ??
      emails.find((item) => item.verified)?.email;

    if (!email?.trim()) {
      throw new UnauthorizedException(
        'Разрешите доступ к электронной почте в настройках GitHub.',
      );
    }

    return email.trim();
  }
}
