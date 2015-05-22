README.md

## This is a small project that implements a chat session between clients using socket.io.

Some Design Considerations...

Users have multiple devices but will login through one username. How do we ensure everyone is on the same page? Well rooms are created on the username so users who "Create a room" that already exists will just join the existing room. This assumes this is the same person, just on multiple devices. It would not impact how many messages other unique persons in that room will see and all his other connected devices will get his sent messagess (and he can send messages from multiple devices) seamlessly.

How do we get past messages? Well every message sent is to the server is redirected back to other connected clients. We can go the extra step and copy this message into a database also. But then it gets tricky... how do I sort these messages (surely you need more than a date, the sender's name and the message)? This is a pretty complex problem so design matters. For the purpose of this project, I am just going to persist messages straight to the database using (NAME, ROOM-NAME, MESSAGE, SEQUENCE, DATE) and just allow a client to fetch the last 10 messages sent in that room (remember room is by user's name). It gets a little complicated if we want to start sorting these messages by subject matter and we also need to consider size and fetch speed as the table grows. Are humans able to articulate 30 different messages with no real structure?

How do I send pictures? TO BE DETERMINED (more research is needed)!

More to come ...