<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="backend.*" %>

<html>
<body>
	List of failed-to-reproduce urls <br/>
	<% 
		int i=0;
		List<URL> urls = DatabaseInteraction.getAllFailedURLs();
		for (URL u: urls){ 
	%>
			<br/>
			<%= ++i + ") " + u.toString() %>
	<%
		}
	%>
</body>
</html>