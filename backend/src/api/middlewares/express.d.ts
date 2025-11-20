declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      email: string;
      role?: 'admin';
    }
  }
}

export {}; //! Não remova essa linha