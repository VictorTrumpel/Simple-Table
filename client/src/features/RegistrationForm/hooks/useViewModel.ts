import { userService, network } from "@shared/network";
import { useAppDispatch } from "@shared/model";
import { userInfoActions } from "@shared/model";
import type { GetUserDTO } from "src/shared/network/dto/GetUserDTO";

export const useViewModel = () => {
  const dispatch = useAppDispatch();

  const registerUser = async (userInfo: {
    name: string;
    email: string;
    password: string;
  }) => {
    return await userService.registerUser(userInfo);
  };

  const setUserInfo = (getUserDTO: GetUserDTO) => {
    localStorage.setItem("authToken", getUserDTO.token);
    network.defaults.headers.common.Authorization = getUserDTO.token;
    dispatch(userInfoActions.setUserInfo(getUserDTO.userInfo));
  };

  return { registerUser, setUserInfo };
};
