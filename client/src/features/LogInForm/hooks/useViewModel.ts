import { userService, network } from '@shared/network';
import { useAppDispatch, userInfoActions } from '@shared/model';
import type { CreateUserDTO } from '@shared/network';
import type { GetUserDTO } from 'src/shared/network/dto/GetUserDTO';

export const useViewModel = () => {
  const dispatch = useAppDispatch();

  const authUserByData = async (userDto: CreateUserDTO) => {
    return await userService.login(userDto);
  };

  const setUserInfo = (getUserDTO: GetUserDTO) => {
    localStorage.setItem('authToken', getUserDTO.token);
    network.defaults.headers.common.Authorization = `Bearer ${getUserDTO.token}`;
    dispatch(userInfoActions.setUserInfo(getUserDTO.userInfo));
  };

  return { authUserByData, setUserInfo };
};
