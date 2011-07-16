<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="backend.*" %>

<html>
<body>
	 
		List<Email> emails = DatabaseInteraction.getAllEmails();
		for (Email e: emails){ 
	
			<br/>
			e.toString()
	
		}
	
</body>
</html>