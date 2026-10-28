import { userService, network } from '@shared/network';
import { useAppDispatch, userInfoActions } from '@shared/model';
import type { CreateUserDTO } from '@shared/network';
import type { GetUserDTO } from 'src/shared/network/dto/GetUserDTO';

export const useViewModel = () => {
  const dispatch = useAppDispatch();

  const authUserByData = async (userDto: CreateUserDTO) => {
    return await userService.login(userDto);
  };

  const githubLogin = async (code: string) => {
    return await userService.githubLogin(code);
  };

  const googleLogin = async (credential: string) => {
    return await userService.googleLogin(credential);
  };

  const yandexLogin = async (accessToken: string) => {
    return await userService.yandexLogin(accessToken);
  };

  const setUserInfo = (getUserDTO: GetUserDTO) => {
    localStorage.setItem('authToken', getUserDTO.token);
    network.defaults.headers.common.Authorization = `Bearer ${getUserDTO.token}`;
    dispatch(userInfoActions.setUserInfo(getUserDTO.userInfo));
  };

  return {
    authUserByData,
    githubLogin,
    googleLogin,
    yandexLogin,
    setUserInfo,
  };
};
