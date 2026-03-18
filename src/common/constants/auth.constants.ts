export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'loan-api-development-secret',
  expiresIn: 60 * 60,
};
