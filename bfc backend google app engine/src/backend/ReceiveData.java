package backend;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

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
    	logger.finest("inside do get");
    	JsonParser jp = new JsonParser();
    	//reading the cookies as json
    	String reqString = request.getParameter("dataFromClient");
    	String username = request.getParameter("user");
    	String password = request.getParameter("pass");
    	//TODO: sanitize this string before parsing it
    	//since it uses the eval function
    	JsonElement json = jp.parse(reqString == null ? "" : reqString);
    	if (!json.isJsonObject()) {
    		logger.severe("json was not a json object");
    		response.sendError(HttpServletResponse.SC_BAD_REQUEST, 
    				"cookies were not received in correct format");
    		return;
    	}
    	JsonObject jsonObj = json.getAsJsonObject();
    	JsonArray ja = jsonObj.getAsJsonArray("cookies");
    	logger.fine("cookies received successfully");
    	List<Cookie> cookiesList = new LinkedList<Cookie>();
    	for (int i=0; i<ja.size(); i++){
    		cookiesList.add(new Cookie(ja.get(i).toString()));
    	}
    	logger.fine("cookiesList.length: " + cookiesList.size());;
    	if (DatabaseInteraction.authenticate(username, password) != 0){
        	response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "received incorrect credentials");
       		logger.config("received incorrect credentials");
    		return;
    	}
    	User u = DatabaseInteraction.getUser(username);
    	u.setInfo(reqString);
    	logger.fine("updated data of existing user");
    	if (DatabaseInteraction.updateOrSaveUser(u)){
            response.setContentType("text/html");
            PrintWriter out = response.getWriter();
    		out.println("received!");
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
