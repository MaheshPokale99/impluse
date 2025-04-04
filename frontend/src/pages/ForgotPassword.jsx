import AuthForm from "./AuthForm";

const ForgotPassword = () => {
  return (
    <AuthForm
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a link to reset your password"
      buttonText="Send Reset Link"
      endpoint="/api/users/forgot-password"
      redirectPath="/login"
      altText="Remember your password?"
      altLink="Login"
      altHref="/login"
      showNameField={false}
      isForgotPassword={true}
    />
  );
};

export default ForgotPassword; 