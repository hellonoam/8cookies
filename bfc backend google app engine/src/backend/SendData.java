package backend;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * My test servlet
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class SendData extends HttpServlet {
	private Logger logger = Logger.getLogger(SendData.class.getName());
	
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
        response.setContentType("text/html");
        String username = request.getParameter("user");
        String password = request.getParameter("pass");
        PrintWriter out = response.getWriter();
        switch (DatabaseInteraction.authenticate(username, password)){
        case 1:
       		response.sendError(HttpServletResponse.SC_NOT_FOUND, "User, " + username + ", not found");
       		logger.config("ERROR: received request for non-existing user " + username);
       		return;
        case 2:
        	response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Wrong password for " + username);
       		logger.config("ERROR: received incorrect password for user " + username);
       		return;
       	}
        User u = DatabaseInteraction.getUser(username);
       	String cookiesString = u.getCookies();
       	if (cookiesString != null)
       		out.println(cookiesString);
    	out.close();
    	logger.fine("cookies were sent successfully");
    }
}
