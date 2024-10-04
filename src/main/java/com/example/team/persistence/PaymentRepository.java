package com.example.team.persistence;


import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.team.model.PaymentEntity;
import com.example.team.model.ProductEntity;



@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Integer>{
	
	
	
}

