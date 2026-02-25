import {CorsOptions} from 'cors'

export const corsConfig: CorsOptions = {
  origin: function(origin, callback) {
    const wishList = [process.env.FRONTEND_URL];
    if(process.argv[2] === '--api') {
      wishList.push(undefined);
    }
    if(wishList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Error de CORS'));
    }
  }
}