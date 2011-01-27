package backend;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import java.security.SecureRandom;
import BCrypt.BCrypt;;

@PersistenceCapable
public class User {
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

    @Persistent
    private String username;

    @Persistent
    private Text info;
    
    @Persistent
    private String password;
    
    @Persistent
    private String email;
    
    @Persistent
    private String salt;
    
    @Persistent
    private int serial;
    
    private final int entropy = 8;
    
    public User(String username, String plainTextPass, String email, String info) {
      this.username = username == null ? "" : username;
      plainTextPass = plainTextPass == null ? "" : plainTextPass;
      this.password = BCrypt.hashpw(plainTextPass, BCrypt.gensalt());
      this.email = email == null ? "" : email;
      this.info = new Text(info == null ? "" : info);
      generateSalt();
      this.serial = 0;
    }
    
    private void generateSalt(){
    	byte randArr[] = new byte[entropy];
        new SecureRandom().nextBytes(randArr);
        this.salt = "";
        for (int i=0; i<randArr.length; i++)
      	  this.salt += (char) Math.abs(randArr[i]);
    }
    
    public String getSalt(){
    	if (salt == null)
    		throw new IllegalArgumentException("no salt found associated with user"); 
    	return salt;
    }
    
    public int getSerial(){
    	return serial;
    }
    
    public void incrementSerial(){
    	serial++;
    }
    
    public void setSerial(int serial){
    	this.serial = serial;
    }
    
    public void resetSerial(){
    	serial = 0;
    }

    public Key getKey() {
        return key;
    }

    public String getUsername() {
        return username;
    } 

    public String getEmail(){
    	return email;
    }
    
    public boolean comparePassword(String plainTextPass){
    	return BCrypt.checkpw(plainTextPass, password);
    }
    
    public String getInfo(){
    	return info.getValue();
    }

	public void setInfo(String reqString) {
		this.info = new Text(reqString);
		
	}

}