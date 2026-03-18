import { Request } from 'express';
import { AuthTokenPayload } from '../types/data.types';

export interface AuthenticatedRequest extends Request {
  authToken?: string;
  user?: AuthTokenPayload;
}
