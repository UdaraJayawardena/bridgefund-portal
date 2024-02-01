export const errorMapper = {

  getError: (error) => {
    let errorMsg = 'Something went wrong, please try again';

    if (!error) return errorMsg;

    const { code, errmsg } = error;

    if (!code) return errorMsg;

    switch (Number(code)) {

      case 4002: break;
      case 4004: errorMsg = errmsg; break;
      case 403: errorMsg = errmsg; break;
      case 401: errorMsg = 'Unautorized accesss'; break;
      case 4012: errorMsg = 'Your session has expired. Please Sign in again'; break;
      default: break;
    }

    return errorMsg;
  }
};

export default errorMapper;