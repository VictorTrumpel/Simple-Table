import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class YandexIdService {
  async getProfile(accessToken: string) {
    const clientId = process.env.YANDEX_CLIENT_ID?.trim();

    if (!clientId) {
      throw new ServiceUnavailableException('Вход через Яндекс не настроен');
    }

    let profile: unknown;

    try {
      const response = await fetch('https://login.yandex.ru/info?format=json', {
        headers: { Authorization: `OAuth ${accessToken}` },
        signal: AbortSignal.timeout(10_000),
        redirect: 'error',
      });

      if (!response.ok) {
        throw new Error('Yandex rejected the token');
      }

      profile = await response.json();
    } catch {
      throw new UnauthorizedException(
        'Не удалось подтвердить вход через Яндекс. Попробуйте ещё раз.',
      );
    }

    if (
      !profile ||
      typeof profile !== 'object' ||
      !('client_id' in profile) ||
      profile.client_id !== clientId ||
      !('id' in profile) ||
      typeof profile.id !== 'string' ||
      !profile.id.trim()
    ) {
      throw new UnauthorizedException('Недействительный токен Яндекса');
    }

    if (
      !('default_email' in profile) ||
      typeof profile.default_email !== 'string' ||
      !profile.default_email.trim()
    ) {
      throw new UnauthorizedException(
        'Разрешите доступ к электронной почте в настройках Яндекс ID.',
      );
    }

    const name =
      'real_name' in profile && typeof profile.real_name === 'string'
        ? profile.real_name.trim()
        : '';
    const displayName =
      'display_name' in profile && typeof profile.display_name === 'string'
        ? profile.display_name.trim()
        : '';
    const avatarId =
      'default_avatar_id' in profile &&
      typeof profile.default_avatar_id === 'string'
        ? profile.default_avatar_id
        : '';
    const hasAvatar =
      avatarId && 'is_avatar_empty' in profile && !profile.is_avatar_empty;

    return {
      id: profile.id,
      email: profile.default_email.trim(),
      name: name || displayName || profile.default_email.trim(),
      avatarUrl: hasAvatar
        ? `https://avatars.yandex.net/get-yapic/${encodeURIComponent(avatarId)}/islands-200`
        : null,
    };
  }
}
