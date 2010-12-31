<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="backend.*" %>

<html>
<body>
	<% 
		List<User> users = DatabaseInteraction.getAllUsers();
		for (User u: users){
	%>
			u.getUsername() + " " + u.getEmail()		
			<br/>
	<%	
		}
	%>
</body>
</html>