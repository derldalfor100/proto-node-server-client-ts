import {
    ServerUnaryCall,
    sendUnaryData,
    ServiceError,
    ServerWritableStream,
    ServerReadableStream,
    Metadata,
    UntypedHandleCall,
  } from "@grpc/grpc-js";
  import { Empty } from "google-protobuf/google/protobuf/empty_pb";
  
  import { IUsersServer } from "../proto/users_grpc_pb";
  import { User, UserRequest } from "../proto/users_pb";
  import { users } from "./db";
  
  export class UsersServer implements IUsersServer {
      [name: string]: UntypedHandleCall;

      getUser(call: ServerUnaryCall<UserRequest, User>, callback: sendUnaryData<User>) {
        const userId = call.request.getId();
        const user = users.find((u) => u.getId() === userId);
    
        if (!user) {
          const error: ServiceError = {
            name: "User Missing",
            message: `User with ID ${userId} does not exist.`,
            code: 400,
            details: "",
            metadata: new Metadata()
  
          };
          callback(error, null);
          return;
        }
    
        console.log(`getUser: returning ${user.getName()} (id: ${user.getId()}).`);
        callback(null, user);
      }
    
      getUsers(call: ServerWritableStream<Empty, User>) {
        console.log(`getUsers: streaming all users.`);
        for (const user of users) call.write(user);
        call.end();
      }
    
      createUser(
        call: ServerReadableStream<Empty, User>,
        callback: sendUnaryData<Empty>
      ) {
        console.log(`createUsers: creating new users from stream.`);
    
        let userCount = 0;
    
        call.on("data", (u) => {
          userCount++;
          users.push(u);
        });
    
        call.on("end", () => {
          console.log(`Created ${userCount} new user(s).`);
          callback(null, new Empty());
        });
      }
  }