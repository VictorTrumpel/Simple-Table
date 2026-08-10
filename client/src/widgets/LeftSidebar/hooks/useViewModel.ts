import { useAppSelector, userInfoActions, useAppDispatch } from "@shared/model";
import { network } from "@shared/network";

export const useViewModel = () => {
  const dispatch = useAppDispatch();

  const userName = useAppSelector((state) => state.userInfo.user?.name || "");

  const handleLogOut = () => {
    dispatch(userInfoActions.clearUserInfo());
    network.defaults.headers.common.Authorization = undefined;
    localStorage.removeItem("authToken");
  };

  return { userName, handleLogOut };
};
