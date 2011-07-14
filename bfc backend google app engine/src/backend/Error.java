package backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
/**
 * This servlet receives errors that occured on the client side
 * 
 * @author Noam Szpiro
 */
public class Error extends HttpServlet {
	private Logger logger = Logger.getLogger(Error.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	logger.severe("got error from: " + request.getParameter("user")); 
    	logger.severe("the error: " + request.getParameter("error"));
    	response.setContentType("text/html");
        PrintWriter out = response.getWriter();
		out.println("received");
    	out.close();
    }
}
