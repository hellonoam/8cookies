package backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class AddInvite  extends HttpServlet{
	private Logger logger = Logger.getLogger(AddInvite.class.getName());
	
	public void doGet(HttpServletRequest request,
            HttpServletResponse response)
		throws IOException, ServletException
	{
		response.setContentType("text/html");
		String invite = request.getParameter("invite");
		PrintWriter out = response.getWriter();
        if (!DatabaseInteraction.addInvite(invite)){
        	logger.severe("adding invite failed");
        	response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
			"adding invite code failed");
        } else
        	out.println("invite code added " + invite);
        out.close();
	}

}
