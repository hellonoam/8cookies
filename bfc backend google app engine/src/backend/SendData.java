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
    	logger.fine("got get");
        String username = request.getParameter("user");
        String password = request.getParameter("pass");
        double version = 0;
        try {
        	String versionString = request.getParameter("version");
        	if (versionString != null)
        		version = Double.parseDouble(versionString);
        } catch (NumberFormatException e) {
        	logger.severe("version was missing");
        }
        
        int serial = -1;
    	try {
    		if (version != 0)
    			serial = Integer.parseInt(request.getParameter("serial"));
    	} catch (NumberFormatException e){
    		response.sendError(HttpServletResponse.SC_CONFLICT, "invalid serial");
			return;
    	}
    	AuthenticationResponse auth = DatabaseInteraction.authenticate(username, password);
    	if (auth.getResponseType() == AuthenticationResponse.BLOCKED){
    		response.sendError(HttpServletResponse.SC_FORBIDDEN, "wrong passwrod too many times wait:"
    				+ auth.getWaitTime());
       		logger.config("wrong passwrod too many times");
    		return;
    	}
    	if (auth.getResponseType() != AuthenticationResponse.VALID){
        	response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");
       		logger.config("received incorrect credentials");
       		return;
       	}
        User u = DatabaseInteraction.getUser(username);
        if (version != 0)
        	u.setSerial(serial);
        else
        	u.setSerial(-1);
    	boolean succ = DatabaseInteraction.updateOrSaveUser(u);
    	if (!succ)
    		logger.severe("failed to update serial of user");
        JSONObject json = DatabaseInteraction.newJSONInstance();
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
