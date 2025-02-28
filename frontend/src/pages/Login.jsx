import AuthForm from "./AuthForm";

const Login = () => {
  return (
    <AuthForm
      title="Welcome To Impluse"
      buttonText="Login"
      endpoint="/api/users/login"
      redirectPath="/"
      altText="Don't have an account?"
      altLink="Sign up"
      altHref="/signup"
      showNameField={false}
    />
  );
};

export default Login;
