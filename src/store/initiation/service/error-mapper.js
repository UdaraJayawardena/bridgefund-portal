export const errorMapper = {

  getError: (error) => {

    const { code, errmsg } = error;

    switch (Number(code)) {

      case 4002:
      case 4004: return errmsg;
      case 5001: return errmsg;
      case 401: return 'Unautorized accesss';
      case 4012: return 'Your session has expired. Please Sign in again';
      default: return 'Something went wrong, please try again';
    }
  }
};

export default errorMapper;