
No: 0
Name: Authorize
Para: userName,token,operation
Return: code, right(TRUE||FALSE),

No, 1
Name: Register
Para: userName,passWord,parent,userType
Return: code,userName,token,userType

No: 2
Name: Login
Para: userName,passWord
Return: code,userName,token,userType

////Hall
No: 3
Name: CreateHall
Para: userName,token,hallName,hallDescribe,userName(Boss)
Return: code,hallName,roomID

No: 4
Name: EditHall
Para: userName,token,hallName,hallDescribe,userName(Boss)
Return: code,hallName,roomID

No: 5
Name: DeleteHall
Para: userName,token,userName(Boss)
Return: code,roomID

No: 6
Name: GetHallInfo
Para: userName,token,userName(Boss)
Return: code,roomID,hallName,hallDescribe,rooms={},userName(Boss)

////
No: 6
Name: CreateRoom
Para: userName,token,roomName,roomType,roomDescribe,userName(Boss)
Return: code,roomID

No: 4
Name: DeleteRoom
Para: userName,token,roomID,userName(Boss)
Return: code,roomID

No: 4
Name: EditRoom
Para: userName,token,roomName,roomType,roomDescribe,userName(Boss)
Return: code,roomID

No: 4
Name: GetRoomInfo
Para: userName,token,roomID
Return: code,roomID,roomName,roomDesccibe,nunOfUsers,roomType


////Account

No: 4
Name: AddAccount
Para: userName,token,userName,operation,score,note
Return: code

Name: Summary
Para: userName,token,userName,
Return, code

Name: GetAccount
Para: userName,token,userName,
Return, code,res['']
