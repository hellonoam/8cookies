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
    	String reqString = request.getParameter("cookiesFromClient");
    	String username = request.getParameter("user");
    	String password = request.getParameter("pass");
    	logger.fine("username received " + username);
    	JsonElement json = jp.parse(reqString == null ? "" : reqString);
        response.setContentType("text/html");
    	if (!json.isJsonArray()) {
    		logger.severe("json was not an array");
    		response.sendError(HttpServletResponse.SC_BAD_REQUEST, 
    				"cookies were not received in correct format");
    		return;
    	}
    	logger.fine("cookies received successfully");
    	JsonArray ja = json.getAsJsonArray();
    	List<Cookie> cookiesList = new LinkedList<Cookie>();
    	for (int i=0; i<ja.size(); i++){
    		cookiesList.add(new Cookie(ja.get(i).toString()));
    	}
    	logger.fine("cookiesList.length: " + cookiesList.size());;
    	User u = DatabaseInteraction.getUser(username);
    	if (u == null){
    		u = new User(username, password, reqString);
    		logger.fine("new user added to db");
    	} else{
    		u.setCookies(reqString);
    		logger.fine("updated cookies of existing user");
    	}
    	if (DatabaseInteraction.updateOrSaveUser(u)){
            PrintWriter out = response.getWriter();
    		out.println("received!");
        	out.close();
    		logger.fine("data received successfully");
    	} else {
    		response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "faild to update/save user");
    		logger.severe("failed to update/save user");
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
