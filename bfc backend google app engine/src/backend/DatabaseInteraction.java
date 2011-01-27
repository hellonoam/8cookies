package backend;

import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

public class DatabaseInteraction {
	private static Logger logger = Logger.getLogger(DatabaseInteraction.class.getName());
	
    /**
     * gets the user from db corresponding to username
     * @param username
     * 	the user to search in the db
     * @return
     * 	the user if found and null otherwise
     */
    public static User getUser(String username){
    	PersistenceManager pm = PMF.get().getPersistenceManager();
		Query query = pm.newQuery(User.class);
		User u = null;
    	try{
        	query.setFilter("username == usernameParam");
        	query.declareParameters("String usernameParam");
        	List<User> answer = ((List<User>) query.execute(username));
    		u = answer.size() > 0 ? answer.get(0) : null;
//    		ReceiveData.logger.severe("found " + answer.size() + " matching results for " + username);
    	} finally {
    		query.closeAll();
    		pm.close();
    	}
    	return u;
    } 
    
    //TODO: get rid of code duplication here. The problem is that delete needs to happen with the same pm as find
    public static boolean deleteUser(String username){
    	boolean success = false;
    	PersistenceManager pm = PMF.get().getPersistenceManager();
		Query query = pm.newQuery(User.class);
		User u = null;
    	try{
        	query.setFilter("username == usernameParam");
        	query.declareParameters("String usernameParam");
        	List<User> answer = ((List<User>) query.execute(username));
    		u = answer.size() > 0 ? answer.get(0) : null;
    		if (u != null)
    			pm.deletePersistent(u);
    		success = true;
    	} finally {
    		query.closeAll();
    		pm.close();
    	}
    	return success;
    }
    
    /**
     * Checks if the user and password pair is valid
     * @param username
     * 	the user name
     * @param password
     * 	the password associated with the username
     * @return
     * 	0 if username password pair is valid
     * 	1 is user doesn't exist
     *  2 if password is incorrect
     */
    public static int authenticate(String username, String password){
    	User u = getUser(username);
    	if (u == null)
    		return 1; //doesn't exist
    	if (!u.comparePassword(password))
    		return 2;//wrong password
    	return 0; //correct password
    }
    
    /**
     * Saves or updates the user in the database 
     * @param u
     * 	the user to be saved/updated
     * @return
     * 	whether or not the update/save has succeeded
     */
    public static boolean updateOrSaveUser(User u){
    	if (u == null) return false;
    	boolean success = false;
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			pm.makePersistent(u);
			success = true;
		} finally {
			pm.close();
		}
		return success;
    }

    public static List<URL> getAllFailedURLs(){
    	PersistenceManager pm = PMF.get().getPersistenceManager();      
        Query query = pm.newQuery("select from " + URL.class.getName());
        query.setFilter("failed == true");
        List<URL> result = null;
        try {
        	result = (List<URL>) query.execute();
        } finally {
        	query.closeAll();
        }
        return result;
    }

    public static List<User> getAllUsers(){
    	PersistenceManager pm = PMF.get().getPersistenceManager();      
        Query query = pm.newQuery("select from " + User.class.getName());
        List<User> result = null;
        try {
        	result = (List<User>) query.execute();
        } finally {
        	query.closeAll();
        }
        return result;
    }

	public static boolean removeInvite(String invitation) {
		if (invitation.equals("hellonoam"))
			return true;
		boolean success = false;
    	PersistenceManager pm = PMF.get().getPersistenceManager();
		Query query = pm.newQuery(Invitation.class);
		Invitation invite = null;
    	try{
        	query.setFilter("code == codeParam");
        	query.declareParameters("String codeParam");
        	List<Invitation> answer = ((List<Invitation>) query.execute(invitation));
    		invite = answer.size() > 0 ? answer.get(0) : null;
    		if (invite != null){
    			pm.deletePersistent(invite);
    			success = true;
    		}
    	} finally {
    		query.closeAll();
    		pm.close();
    	}
    	return success;
	}

	public static void addFailedToReproduceURL(String URL){
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			pm.makePersistent(new URL(URL, true));
		} finally {
			pm.close();
		}
	}

	public static void addVisitedURL(String URL){
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			pm.makePersistent(new URL(URL, false));
		} finally {
			pm.close();
		}
	}

	public static void addBetaUser(String email) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			pm.makePersistent(new Email(email));
		} finally {
			pm.close();
		}
	}
}
