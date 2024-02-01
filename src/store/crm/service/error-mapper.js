export const errorMapper = {

  getError: (error) => {

    const { httpCode, message } = error;

    switch (Number(httpCode)) {

      case 400:
      case 500: return message;
      case 401: return error.error ? error.error.errmsg : 'Unauthorized access';
      default: {
        
        const defaultError = 'Something went wrong, please try again';
        // Temporary add below code because of
        if(error.error) return error.error ? error.error.errmsg : defaultError;

        return message ? message : defaultError;
      }
    }
  }
};

export default errorMapper;