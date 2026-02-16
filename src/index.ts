import colors from 'colors';

import server from "./server";


const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(colors.blue.bold(`Servidor funcionando en el puerto: ${PORT}`));
});