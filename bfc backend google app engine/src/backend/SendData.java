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
        PrintWriter out = response.getWriter();
        User u = DatabaseInteraction.getUser(username);
       	if (u == null){
       		response.sendError(HttpServletResponse.SC_NOT_FOUND, "User, " + username + ", not found");
       		logger.warning("ERROR: received request for non-existing user " + username);
       		return;
       	}
       	String cookiesString = u.getCookies();
       	if (cookiesString != null)
       		out.println(cookiesString);
    	out.close();
    	logger.fine("cookies were sent successfully");
    }
}
