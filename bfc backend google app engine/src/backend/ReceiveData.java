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
 * This servlet receives data from the user and stores it in the db 
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class ReceiveData extends HttpServlet {
	private Logger logger = Logger.getLogger(ReceiveData.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	logger.severe("inside do get");
    	//reading the cookies as json
    	String reqString = request.getParameter("dataFromClient");
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
    	logger.severe("got request from: " + username + " version: " + version);
    	try {
    		serial = Integer.parseInt(request.getParameter("serial"));
    	} catch (NumberFormatException e){
    		response.sendError(HttpServletResponse.SC_CONFLICT, "serial conflict - serial missing" +
    				" - update was rejected");
			return;
    	}

    	logger.fine("serial " + serial);
    	AuthenticationResponse auth = DatabaseInteraction.authenticate(username, password);
    	if (auth.getResponseType() == AuthenticationResponse.BLOCKED){
    		response.sendError(HttpServletResponse.SC_FORBIDDEN, "wrong passwrod too many times wait:"
    				+ auth.getWaitTime());
       		logger.fine("wrong passwrod too many times");
    		return;
    	}
    	if (auth.getResponseType() != AuthenticationResponse.VALID){
        	response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");
       		logger.fine("received incorrect credentials");
    		return;
    	}
    	User u = DatabaseInteraction.getUser(username);
    	if (version == 0)
    		u.setSerial(-1);
    	else if (u.getSerial() == -1)
    		u.setSerial(serial);
    	else if (serial != u.getSerial()){
			u.setSerial(serial);
			boolean succ = DatabaseInteraction.updateOrSaveUser(u);
			if (!succ)
				logger.severe("failed to update serial of user");
    		String infoString = u.getInfo();
    		if (infoString != null && !infoString.equals("")){
    			JSONObject jsonResponse = DatabaseInteraction.newJSONInstance();
    	        try {
    	        	jsonResponse.append("info", u.getInfo());
    	        	jsonResponse.append("salt", u.getSalt());
    	        	response.setContentType("text/html");
    	        	PrintWriter out = response.getWriter();
    	        	out.println(jsonResponse);
    	        	out.close();
    	        } catch (JSONException e) {
    	        	e.printStackTrace();
    	        	logger.severe("failed to send info to client after conflict");
    	        }
    	    }
    		return;
    	}
    	u.setInfo(reqString);
    	logger.fine("updated data of existing user");
    	if (DatabaseInteraction.updateOrSaveUser(u)){
            response.setContentType("text/html");
            PrintWriter out = response.getWriter();
    		out.println("received");
        	out.close();
    		logger.fine("data received successfully");
    	} else {
    		response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "faild to update/save user");
    		logger.severe("ERROR: failed to update/save user");
    	}
    }
    
    public void doPost(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
	{
    	logger.finest("inside do post");
    	doGet(request, response);
	}
}
