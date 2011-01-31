package backend;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This servlet receives data from the user and stores it in the db 
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class VisitedURL extends HttpServlet {
	private Logger logger = Logger.getLogger(VisitedURL.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	String URL = request.getParameter("url");
    	DatabaseInteraction.addVisitedURL(URL);
    }
    
    public void doPost(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	logger.finest("inside do post");
    	doGet(request, response);
    }
}
