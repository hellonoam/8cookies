package backend;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * This sevlets delete all information about a user from the db after authentication, of course!
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class DeleteCookiesFromServer extends HttpServlet {
	private Logger logger = Logger.getLogger(DeleteCookiesFromServer.class.getName());
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
        String username = request.getParameter("user");
        String password = request.getParameter("pass");

        AuthenticationResponse auth = DatabaseInteraction.authenticate(username, password);
    	if (auth.getResponseType() == AuthenticationResponse.BLOCKED){
    		response.sendError(HttpServletResponse.SC_FORBIDDEN, "wrong passwrod too many times wait:"
    				+ auth.getWaitTime());
       		logger.config("wrong passwrod too many times");
    		return;
    	}
    	if (auth.getResponseType() != AuthenticationResponse.VALID){
        	response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");
        	return;
        }

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();        
        if (DatabaseInteraction.deleteUser(username)){
        	logger.severe("info for " + username + " was deleted");
        	out.println("info for " + username + " was deleted from server");
        } else {
        	logger.severe("ERROR: failed to delete " + username);
        	out.println("ERROR: failed to delete " + username + " from server");
        }
        out.close();
    }
}
