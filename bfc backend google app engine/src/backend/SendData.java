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
 * This servlet sends that was stored in the db for a specific user
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
		//gets parameters of this request
        String username = request.getParameter("user");
        String password = request.getParameter("pass");
        double version = 0;
		//parses the version number of the extension given as a param
        try {
        	String versionString = request.getParameter("version");
        	if (versionString != null)
        		version = Double.parseDouble(versionString);
        } catch (NumberFormatException e) {
        	logger.severe("version was missing");
        }
        //sets the serial to be the serial received or -1 which represents an extension version that
		//does not yet have the new serial method
        int serial = -1;
    	try {
    		if (version != 0)
    			serial = Integer.parseInt(request.getParameter("serial"));
    	} catch (NumberFormatException e){
    		response.sendError(HttpServletResponse.SC_CONFLICT, "invalid serial");
			return;
    	}
		//authenticates users
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
		//user has been authenticated
        User u = DatabaseInteraction.getUser(username);
        if (version != 0)
        	u.setSerial(serial);
        else
        	u.setSerial(-1);
		//updates the serial for the user in the db
    	boolean succ = DatabaseInteraction.updateOrSaveUser(u);
    	if (!succ)
    		logger.severe("failed to update serial of user");
        JSONObject json = DatabaseInteraction.newJSONInstance();
        try {
			//sends needed information to the client
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
