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
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

/**
 * This servlet receives data from the user and stores it in the db 
 *
 * @author Noam Szpiro
 */

@SuppressWarnings("serial")
public class ReceiveData extends HttpServlet {
	private Logger logger = Logger.getLogger(ReceiveData.class.getName()); 

	private final int serialLimit = 30000;

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	logger.finest("inside do get");
    	JsonParser jp = new JsonParser();
    	//reading the cookies as json
    	String reqString = request.getParameter("dataFromClient");
    	String username = request.getParameter("user");
    	String password = request.getParameter("pass");
    	int serial = -1;
    	try {
    		serial = Integer.parseInt(request.getParameter("serial"));
    	} catch (NumberFormatException e){
    		response.sendError(HttpServletResponse.SC_CONFLICT, "serial conflict - update was rejected");
			return;
    	}

    	logger.fine("serial " + serial);
    	AuthenticationResponse auth = DatabaseInteraction.authenticate(username, password);
    	if (auth.getResponseType() == 3){
    		response.sendError(HttpServletResponse.SC_FORBIDDEN, "wrong passwrod too many times wait:"
    				+ auth.getWaitTime());
       		logger.fine("wrong passwrod too many times");
    		return;
    	}
    	if (auth.getResponseType() != 0){
        	response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");
       		logger.fine("received incorrect credentials");
    		return;
    	}
   	
    	User u = DatabaseInteraction.getUser(username);
    	
    	if (serial == 1)
    		u.setSerial(1);
    	else{
    		if (serial != u.getSerial() + 1){
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
    		} else {
    			u.incrementSerial();
    			if (u.getSerial() == serialLimit)
    				u.setSerial(1);
    		}
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
