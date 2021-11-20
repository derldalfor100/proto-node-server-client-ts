import { Server, ServerCredentials } from "@grpc/grpc-js";
import { UsersService } from "../proto/users_grpc_pb";
import { UsersServer } from "./services";

const server = new Server();
server.addService(UsersService, new UsersServer());

const port = 3000;
const uri = `localhost:${port}`;

server.bindAsync(uri, ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        throw err;
    }
    server.start();

    console.log(`Listening on ${uri}`);
});