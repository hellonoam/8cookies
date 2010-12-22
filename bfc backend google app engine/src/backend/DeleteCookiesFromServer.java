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
        PrintWriter out = response.getWriter();
        if (DatabaseInteraction.deleteAllUsersAndCookies()){
        	logger.severe("all cookies and users deleted");
        	out.println("cookies and users from server deleted");
        } else {
        	logger.severe("ERROR: failed to delete users and cookies");
        	out.println("ERROR: failed to delete users and cookies");
        }
    }
}
