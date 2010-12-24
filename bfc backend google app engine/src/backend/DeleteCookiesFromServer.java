package backend;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
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
public class DeleteCookiesFromServer extends HttpServlet {
	private Logger logger = Logger.getLogger(DeleteCookiesFromServer.class.getName());
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
        response.setContentType("text/html");
        String username = request.getParameter("user");
        String password = request.getParameter("pass");

        
        if (username == null || username.equals("") || 
        		DatabaseInteraction.authenticate(username, password) != 0){
        	response.sendError(HttpServletResponse.SC_UNAUTHORIZED, 
        			"username or password invalid");
        	return;
        }
        
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
