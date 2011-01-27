package backend;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.repackaged.org.json.JSONException;
import com.google.appengine.repackaged.org.json.JSONObject;

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
        String username = request.getParameter("user");
        String password = request.getParameter("pass");
        if (DatabaseInteraction.authenticate(username, password) != 0){
        	response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");
       		logger.config("received incorrect credentials");
       		return;
       	}
        User u = DatabaseInteraction.getUser(username);
        JSONObject json = new JSONObject();
        try {
			json.append("info", u.getInfo());
			json.append("salt", u.getSalt());
			response.setContentType("text/html");
	        PrintWriter out = response.getWriter();
	       	out.println(json);
	        out.close();
	    	logger.fine("info was sent successfully");
		} catch (JSONException e) {
			e.printStackTrace();
			logger.severe("failed to send info to client");
		}
    }
}
