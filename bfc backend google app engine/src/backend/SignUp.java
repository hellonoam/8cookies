package backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
public class SignUp extends HttpServlet {
	private Logger logger = Logger.getLogger(SignUp.class.getName()); 

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
    	logger.finest("inside do get");
    	String username = request.getParameter("user");
    	String password = request.getParameter("pass");
    	String invitation = request.getParameter("invite");
    	String callback = sanitizeJsonpParam(request.getParameter("callback"));
    	String email = request.getParameter("email");
    	logger.fine("username received " + username);
    	User u = DatabaseInteraction.getUser(username);
        response.setContentType("application/x-javascript");
        PrintWriter out = response.getWriter();
    	if (u != null){
    		//user in use
    		logger.fine("username exists");
    		if (callback != null)
    			out.println(callback + "({response: 'in-use'});");//TODO: maybe change this to something shorter
        	out.close();
        	return;
    	}
        if (!DatabaseInteraction.removeInvite(invitation)) {
        	logger.fine("unknown invite");
    		if (callback != null)
    			out.println(callback + "({response: 'unknown-invitation'});");
        	out.close();
        	return;
        }        
    	//checking if valid username and password
		if (!validUsernameAndPassword(username, password)){
			out.println("username and/or password were not acceptable");
			out.close();
			return;
		}
    	//inserting new user to db
   		u = new User(username, password, email, ""); //TODO: check that ""is correct here
       	if (DatabaseInteraction.updateOrSaveUser(u)){
       		if (callback != null)
       			out.println(callback + "({response: 'success'});");//TODO: maybe change this to something shorter
       		logger.fine("data received successfully");
       	} else {
       		response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "failed to signup user");
       		logger.severe("failed to sign up user");
       	}
   		out.close();
    }
    
    private boolean validUsernameAndPassword(String username, String password) {
    	//TODO: finish this
		return true;	
	}
    
    /**
     * This protects the user from having the server act as a helper in 
     * running malicious code on the client, since it executes the code
     * given in the url on the client's machine. It cannot infect the server
     * 
     * makes sure the jsonp received with the callback param is a valid one
     * @param s
     * 	the callback received
     * @return
     * 	null of the callback is invalid
     * 	s otherwise
     */
    public String sanitizeJsonpParam(String s) {
    	if ( s == null ||
    		 s.isEmpty() ||
    	    !s.toLowerCase().startsWith("jsonp") ||
    	     s.length() > 128 ||
    	    !s.matches("^jsonp\\d+$")) {
    		logger.severe("callback was invalid " + s);
    		return null;
    	}
    	return s;
    }

	public void doPost(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
        {
    		logger.finest("inside do post");
    		doGet(request, response);
        }
}
