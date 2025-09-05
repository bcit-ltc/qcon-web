from django.db import models
from django.core.exceptions import ValidationError
# Create your models here.

class Conversion(models.Model): 
    id = models.AutoField(primary_key=True)
    session = models.TextField(blank=True, null=True) 
    transaction = models.TextField(blank=True, null=True) 
    def __str__(self):
        return str(self.id) + " session: " + str(self.session)

class Status(models.Model):
    id = models.AutoField(primary_key=True)
    connected = models.BooleanField(default=False, blank=True, null=True) 
    api_hostname = models.TextField(blank=True, null=True) 
    # def save(self, *args, **kwargs):
    #     if not self.pk and Status.objects.exists():
    #     # if you'll not check for self.pk 
    #     # then error will also raised in update of exists model
    #         pass
    #         # raise ValidationError('There is can be only one Status instance')
    #     return super(Status, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.id)

# class Connection(models.Model):
#     id = models.AutoField(primary_key=True)
#     session = models.TextField(blank=True, null=True) 
#     Datadump = models.TextField(blank=True, null=True) 

#     def __str__(self):
#         return str(self.id)