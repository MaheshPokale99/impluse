import AuthForm from "./AuthForm";

const Signup = () => {
  return (
    <AuthForm
      title="Create an Account"
      buttonText="Sign Up"
      endpoint="/api/users/register"
      redirectPath="/login"
      altText="Already have an account?"
      altLink="Login"
      altHref="/login"
      showNameField={true}
    />
  );
};

export default Signup;
