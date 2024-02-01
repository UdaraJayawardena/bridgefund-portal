const base64_to_pdf = ( params ) => {
  if( params && ( typeof params === "object") && ( params.mimetype === "application/pdf" ) ) {

    const response = {
      file : atob( params.buffer ),
    };

    return response.file;

  } 
    return params;
  
};

const file_to_base64 = async ( file ) => {
  return new Promise( ( resolve, reject ) => {
    try {
      if( file && ( file instanceof File ) ) {
        const reader = new FileReader();

        reader.onloadend = () => {
          // @ts-ignore
          const fileDetails = reader.result.match( /^data:.+;base64,/, '' )[0];
          // @ts-ignore
          const base64 = reader.result.replace( /^data:.+;base64,/, '' );

          resolve( {
            'originalname' : file.name,
            'mimetype' : fileDetails.split( ';' )[0].replace( 'data:', '' ),
            'buffer' : base64
          } );
        };

        reader.readAsDataURL(file);

      } else {
        resolve( file );
      }
    } catch (error) {
      console.error(error);
      reject( error );
    }
  } );
};

export default {
  base64_to_pdf,
  file_to_base64
};