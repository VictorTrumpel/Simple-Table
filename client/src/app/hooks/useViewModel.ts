import { userService, network } from "@shared/network";
import { userInfoActions } from "@shared/model";
import { useAppDispatch } from "@shared/model";
import { useAppSelector } from "@shared/model";

export const useViewModel = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.userInfo.user);

  const authUser = async () => {
    const savedAuthToken = localStorage.getItem("authToken");

    if (!savedAuthToken) return null;

    network.defaults.headers.common.Authorization = savedAuthToken;

    const response = await userService.getUserInfo();

    if (response.error || response.data === null) {
      localStorage.removeItem("authToken");
      network.defaults.headers.common.Authorization = undefined;
      return;
    }

    if (response.data) {
      dispatch(userInfoActions.setUserInfo(response.data));
    }
  };

  return { user, authUser };
};
