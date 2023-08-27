import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateRole,
  deleteUser,
} from "../controllers/userController.js";
import { authorizedRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const userRouter = Router();

userRouter
  .post("/register", registerUser)
  .post("/login", loginUser)
  .post("/password/forgot", forgotPassword);
userRouter
  .get("/logout", logoutUser)
  .get("/me", isAuthenticatedUser, getUserDetails)
  .get(
    "/admin/users",
    isAuthenticatedUser,
    authorizedRoles("admin"),
    getAllUsers
  )
  .get(
    "/admin/user/:id",
    isAuthenticatedUser,
    authorizedRoles("admin"),
    getSingleUser
  );
userRouter
  .put("/password/reset/:token", resetPassword)
  .put("/password/update", isAuthenticatedUser, updatePassword)
  .put("/me/update", isAuthenticatedUser, updateProfile)
  .put(
    "/admin/user/:id",
    isAuthenticatedUser,
    authorizedRoles("admin"),
    updateRole
  );

userRouter.delete(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  deleteUser
);

export default userRouter;
