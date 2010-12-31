package backend;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

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
    
    public User(String username, String password, String email, String info) {
      this.username = username;
      this.password = password;
      this.email = email;
      this.info = new Text(info);
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
    
    public String getPassword(){
    	return password;
    }
    
    public String getInfo(){
    	return info.getValue();
    }

	public void setInfo(String reqString) {
		this.info = new Text(reqString);
		
	}

}