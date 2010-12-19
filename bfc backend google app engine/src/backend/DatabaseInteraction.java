package backend;

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

public class DatabaseInteraction {
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
    
    /**
     * Saves or updates the user in the database 
     * @param u
     * 	the user to be saved/updated
     * @return
     * 	whether or not the update/save has succeeded
     */
    public static boolean updateOrSaveUser(User u){
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

    /**
     * Deletes all users and cookies from db
     * @return
     *  whether or not the operation has succeeded
     */
	public static boolean deleteAllUsersAndCookies() {
		boolean success = false;
		PersistenceManager pm = PMF.get().getPersistenceManager();
        Query queryCookie = pm.newQuery("select from " + Cookie.class.getName());
        Query queryUser = pm.newQuery("select from " + User.class.getName());
        try{
        	queryCookie.deletePersistentAll();
        	queryUser.deletePersistentAll();
        	success = true;
    	} finally {
    		queryCookie.closeAll();
    		queryUser.closeAll();
    		pm.close();
        }
    	return success;
		
	}
}
